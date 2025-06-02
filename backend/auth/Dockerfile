FROM maven:3.9.9-amazoncorretto-24-alpine AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .

RUN mvn clean package -DskipTests && ls -lh /app/target

FROM amazoncorretto:24-alpine

WORKDIR /app
RUN ls -lh /app
COPY --from=builder /app/target/auth-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080 5841

ENTRYPOINT ["java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5841", "-jar", "app.jar"]
