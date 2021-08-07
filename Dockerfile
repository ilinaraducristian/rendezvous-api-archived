FROM ilinaraducristian/node-mediasoup:16.6.1-alpine3.14-mediasoup3.8.0
COPY dist /usr/src
COPY prod.env /usr/src/.env
COPY package.json /usr/src/package.json
COPY yarn.lock /usr/src/yarn.lock
WORKDIR /usr/src
RUN yarn install "--production"
COPY grant-manager.js /usr/src/node_modules/keycloak-connect/middleware/auth-utils/grant-manager.js
EXPOSE 80
CMD ["yarn", "run", "start:prod"]