package com.pms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.MemberCreationRequest;
import com.pms.backend.dto.request.MemberUpdateRequest;
import com.pms.backend.dto.response.MembersResponse;
import com.pms.backend.service.MembersService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/members")
public class MembersController {
    MembersService membersService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<MembersResponse> addMember(
            @PathVariable int projectId,
            @RequestBody MemberCreationRequest request,
            @RequestHeader("userId") String userId) {
        MembersResponse response = membersService.addMember(projectId, request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MembersResponse>> getMembersByProject(
            @PathVariable int projectId,
            @RequestHeader("userId") String userId) {
        List<MembersResponse> members = membersService.getMembersByProject(projectId, userId);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<MembersResponse> updateMember(
            @PathVariable int memberId,
            @RequestBody MemberUpdateRequest request,
            @RequestHeader("userId") String userId) {
        MembersResponse response = membersService.updateMember(memberId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable int memberId,
            @RequestHeader("userId") String userId) {
        membersService.deleteMember(memberId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MembersResponse>> searchUsers(
            @RequestParam String query,
            @RequestHeader("userId") String userId) {
        List<MembersResponse> users = membersService.searchUsers(query, userId);
        return ResponseEntity.ok(users);
    }
    @DeleteMapping("/project/{projectId}/email/{email}")
    public ResponseEntity<Void> deleteMemberByEmail(
            @PathVariable int projectId,
            @PathVariable String email,
            @RequestHeader("userId") String userId) {
        membersService.deleteMemberByEmailAndProject(email, projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/project/{projectId}/transfer-leader")
    public ResponseEntity<Void> transferLeader(
            @PathVariable int projectId,
            @RequestBody MemberCreationRequest request,
            @RequestHeader("userId") String userId) {
        membersService.transferLeader(projectId, request.getEmail(), userId);
        return ResponseEntity.ok().build();
    }
}