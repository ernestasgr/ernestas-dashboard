FROM maven:3.9.9-amazoncorretto-24-alpine as builder

WORKDIR /app

COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]