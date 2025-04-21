#!/bin/bash

# Определяем путь к директории скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Активируем виртуальное окружение
source "$SCRIPT_DIR/my_env/bin/activate"

# Переходим в директорию проекта
cd "$SCRIPT_DIR/fasad"

# Запускаем сервер
python3 manage.py runserver 8888 