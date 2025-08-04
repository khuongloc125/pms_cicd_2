package com.pms.backend.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.UserCreationRequest;
import com.pms.backend.dto.request.UserUpdateRequest;
import com.pms.backend.dto.response.UserResponse;
import com.pms.backend.entity.Members;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.User;
import com.pms.backend.enums.AuthProvider;
import com.pms.backend.enums.Role;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.UserMapper;
import com.pms.backend.repository.MemberRepository;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserService {
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
    final UserMapper userMapper;
    final ProjectRepository projectRepository;
    final MemberRepository memberRepository;
    private static final String DEFAULT_AVATAR_URL = "http://localhost:8080/uploads/avatars/default-avatar.png";

    public User createRequest(UserCreationRequest request){

        User user = userMapper.toUser(request);
        if(userRepository.existsByEmail(request.getEmail())){
            throw  new AppException(ErrorStatus.USER_EXISTED);
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAuthProvider(AuthProvider.LOCAL); // Thêm giá trị mặc định
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDate.now());
        user.setAvatar_url(DEFAULT_AVATAR_URL);
        return userRepository.save(user);
    }

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public UserResponse updateUserRequest(UUID id, UserUpdateRequest request){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        userMapper.updateUser(user, request);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserRequestEmail(String email, UserUpdateRequest request){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        userMapper.updateUser(user, request);
        String oldName = user.getName();
        if (request.getName() != null && !request.getName().equals(oldName)) {
            updateProjectLeaderAndMembers(email, oldName, request.getName());
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(UUID id){
        userRepository.deleteById(id);
    }

    public List<User> getUsers(){
        return userRepository.findAll();
    }

    public UserResponse getUser(UUID id){
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND)));
    }
    public int getUserCount() {
        return (int) userRepository.count();
    }
    public int countUsersByMonth(YearMonth month) {
        LocalDate startOfMonth = month.atDay(1);
        LocalDate endOfMonth = month.atEndOfMonth();
        return (int) userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null &&
                        !user.getCreatedAt().isBefore(startOfMonth) &&
                        !user.getCreatedAt().isAfter(endOfMonth))
                .count();
    }

    private void updateProjectLeaderAndMembers(String email, String oldName, String newName) {
    List<Project> projects = projectRepository.findAllByLeaderOrMembers(oldName);
    for (Project project : projects) {
        if (project.getLeader() != null && project.getLeader().equals(oldName)) {
            project.setLeader(newName);
        }
        if (project.getMembers() != null && project.getMembers().contains(oldName)) {
            String updatedMembers = project.getMembers().replace(oldName, newName);
            project.setMembers(updatedMembers);
        }
        projectRepository.save(project);
    }
    List<Members> members = memberRepository.findAllByEmail(email);
    for (Members member : members) {
        member.setName(newName);
        memberRepository.save(member);
    }
}
}
