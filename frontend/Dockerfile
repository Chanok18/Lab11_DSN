FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY champions-logo.png* /tmp/logos/
RUN if [ -f /tmp/logos/champions-logo.png ]; then \
      cp /tmp/logos/champions-logo.png /usr/share/nginx/html/champions-logo.png; \
    fi
EXPOSE 80
