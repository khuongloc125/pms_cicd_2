package com.pms.backend.mapper;

import com.pms.backend.dto.request.MemberCreationRequest;
import com.pms.backend.dto.request.MemberUpdateRequest;
import com.pms.backend.dto.response.MembersResponse;
import com.pms.backend.entity.Members;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MembersMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "projectId", ignore = true)
    @Mapping(target = "invitedByName", ignore = true)
    @Mapping(target = "invitedAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    Members toMember(MemberCreationRequest request);

    MembersResponse toMemberResponse(Members member);

    void updateMember(@MappingTarget Members member, MemberUpdateRequest request);
}