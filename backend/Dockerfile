FROM python:3.12
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    python3-dev \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /code/
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY manage.py .
COPY ./backend ./backend/
COPY ./payments ./payments/
COPY ./owner ./owner/
COPY ./user_auth ./user_auth/
EXPOSE 8000

# Copy the wait-for-postgres script
COPY wait-for-postgres.sh /usr/local/bin/wait-for-postgres.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY migrate-entrypoint.sh /usr/local/bin/migrate-entrypoint.sh
RUN chmod +x /usr/local/bin/wait-for-postgres.sh /usr/local/bin/entrypoint.sh /usr/local/bin/migrate-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
