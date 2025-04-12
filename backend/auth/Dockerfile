FROM maven:3.9.9-amazoncorretto-24-alpine AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]
