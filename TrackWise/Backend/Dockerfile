# Stage 1 build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR src
COPY . .
RUN dotnet publish -c Release -o apppublish

# Stage 2 run
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR app
COPY --from=build apppublish .
ENTRYPOINT [dotnet, Backend.dll]