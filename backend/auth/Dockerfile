FROM maven:3.9.9-amazoncorretto-24-alpine AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .

RUN mvn package -DskipTests

FROM amazoncorretto:24-alpine

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080 5841

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:-} -jar app.jar"]
