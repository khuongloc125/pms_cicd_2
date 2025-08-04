package com.pms.backend.mapper;

import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProjectMapper {

    @Mapping(target = "created_at", expression = "java(java.time.LocalDate.now())")
    @Mapping(target = "color", ignore = true)
    @Mapping(target = "short_name", ignore = true)
    @Mapping(target = "created_by_id", ignore = true)
    @Mapping(target = "created_by_name", ignore = true)
    @Mapping(target = "leader", ignore = true)
    @Mapping(target = "start_date", source = "start_date")
    @Mapping(target = "end_date", source = "end_date")
    @Mapping(target = "status", constant = "ACTIVE")
    Project toProject(ProjectCreationRequest request);

    ProjectResponse toProjectResponse(Project project);

    @Mapping(target = "project_name", source = "project_name")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "start_date", source = "start_date")
    @Mapping(target = "end_date", source = "end_date")
    @Mapping(target = "status", source = "status")
    void updateProjectFromRequest(@MappingTarget Project project, ProjectUpdateRequest request);
}
