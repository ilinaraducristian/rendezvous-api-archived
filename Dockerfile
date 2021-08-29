FROM ilinaraducristian/node-mediasoup:latest
COPY package.json /usr/src/package.json
COPY yarn.lock /usr/src/yarn.lock
WORKDIR /usr/src
RUN yarn install "--production"
COPY grant-manager.js /usr/src/node_modules/keycloak-connect/middleware/auth-utils/grant-manager.js
COPY dist /usr/src
EXPOSE 80
CMD ["yarn", "run", "start:prod"]