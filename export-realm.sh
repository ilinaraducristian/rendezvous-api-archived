docker exec -it server_auth_1 /opt/jboss/keycloak/bin/standalone.sh \
  -Djboss.socket.binding.port-offset=100 -Dkeycloak.migration.action=export \
  -Dkeycloak.migration.provider=singleFile \
  -Dkeycloak.migration.realmName=rendezvous \
  -Dkeycloak.migration.usersExportStrategy=REALM_FILE \
  -Dkeycloak.migration.file=/tmp/rendezvous.json

docker cp server_auth_1:/tmp/rendezvous.json .