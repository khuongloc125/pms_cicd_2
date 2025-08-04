# Sử dụng image OpenJDK làm base
FROM openjdk:17-jdk-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file build (JAR) vào container
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar

# Cổng mà Spring Boot chạy
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]