package com.pms.backend.mapper;

import com.pms.backend.dto.request.SprintCreationRequest;
import com.pms.backend.dto.response.SprintResponse;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Sprint;
import com.pms.backend.enums.SprintStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SprintMapper {

    SprintMapper INSTANCE = Mappers.getMapper(SprintMapper.class);

    @Mapping(target = "name", source = "name")
    @Mapping(target = "startDate", source = "startDate", qualifiedByName = "parseLocalDate")
    @Mapping(target = "endDate", source = "endDate", qualifiedByName = "parseLocalDate")
    @Mapping(target = "sprintGoal", source = "sprintGoal")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "project", ignore = true)
    Sprint toSprint(SprintCreationRequest request);


    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "createById", source = "createById")
    @Mapping(target = "createByName", source = "createByName")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "endDate", source = "endDate", qualifiedByName = "formatLocalDate")
    @Mapping(target = "sprintGoal", source = "sprintGoal")
    @Mapping(target = "startDate", source = "startDate", qualifiedByName = "formatLocalDate")
    @Mapping(target = "status", source = "status", qualifiedByName = "mapSprintStatus")
    @Mapping(target = "workItems", source = "workItems")
    @Mapping(target = "projectId", source = "project.id")
    SprintResponse toSprintResponse(Sprint sprint);

    @Named("parseLocalDate")
    default LocalDate parseLocalDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format: " + dateStr, e);
        }
    }

    @Named("formatLocalDate")
    default String formatLocalDate(LocalDate date) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    @Named("mapSprintStatus")
    default String mapSprintStatus(SprintStatus status) {
        return status != null ? status.toString() : null;
    }
}