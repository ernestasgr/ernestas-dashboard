FROM maven:3.9.9-amazoncorretto-24-alpine AS builder

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY . .

EXPOSE 8080 5841

ENV MAVEN_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5841"

CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]
