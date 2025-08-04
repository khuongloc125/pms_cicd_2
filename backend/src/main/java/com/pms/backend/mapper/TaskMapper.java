package com.pms.backend.mapper;

import com.pms.backend.dto.request.TaskCreationRequest;
import com.pms.backend.dto.request.TaskUpdateRequest;
import com.pms.backend.dto.response.TaskResponse;
import com.pms.backend.entity.Task;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    TaskMapper INSTANCE = Mappers.getMapper(TaskMapper.class);

    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "priority", source = "priority")
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "status", constant = "TODO")
    Task toTask(TaskCreationRequest request);

    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "priority", source = "priority")
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "sprint", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateTaskFromRequest(TaskUpdateRequest request, @MappingTarget Task task);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "taskNumber", source = "taskNumber")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "endDate", source = "endDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "priority", source = "priority")
    @Mapping(target = "assigneeId", source = "assignee.id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "sprintId", source = "sprint.id")
    @Mapping(target = "projectId", source = "project.id")
    TaskResponse toTaskResponse(Task task);
}