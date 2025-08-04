package com.pms.backend.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final ErrorStatus errorStatus;
    private final String customMessage;

    public AppException(ErrorStatus errorStatus) {
        super(errorStatus.getMessage());
        this.errorStatus = errorStatus;
        this.customMessage = errorStatus.getMessage();
    }

    public AppException(ErrorStatus errorStatus, String customMessage) {
        super(customMessage);
        this.errorStatus = errorStatus;
        this.customMessage = customMessage;
    }
}