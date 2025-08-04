package com.pms.backend.exception;

import com.pms.backend.dto.request.ApiResponsive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponsive> handlingAppException(AppException exception) {
        ErrorStatus errorStatus = exception.getErrorStatus();
        ApiResponsive apiResponsive = new ApiResponsive();
        apiResponsive.setStatus(errorStatus.getStatus());
        apiResponsive.setMessage(errorStatus.getMessage());
        return ResponseEntity.badRequest().body(apiResponsive);
    }


    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponsive> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage();
        ErrorStatus errorStatus = ErrorStatus.INVALID_KEY;
        try {
            errorStatus = ErrorStatus.valueOf(enumKey);
        } catch (IllegalArgumentException e) {

        }
        ApiResponsive apiResponsive = new ApiResponsive();
        apiResponsive.setStatus(errorStatus.getStatus());
        apiResponsive.setMessage(errorStatus.getMessage());
        return ResponseEntity.badRequest().body(apiResponsive);
    }
}