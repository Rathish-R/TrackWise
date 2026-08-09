# Stage 1 build
FROM mcr.microsoft.comdotnetsdk8.0 AS build
WORKDIR src
COPY . .
RUN dotnet publish -c Release -o apppublish

# Stage 2 run
FROM mcr.microsoft.comdotnetaspnet8.0
WORKDIR app
COPY --from=build apppublish .
ENTRYPOINT [dotnet, Backend.dll]