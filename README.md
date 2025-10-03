# игра "Тетрис"
## Описание
Полнофункциональная браузерная игра Тетрис с современным интерфейсом, системой пользователей и прогрессивной сложностью.

## Особенности

- Классический геймплей - 7 фигур Тетриса
- Система пользователей - сохранение статистики
- Preview фигур - видно следующую фигуру
- Прогрессивная сложность - скорость увеличивается с уровнем
- Клавиатурное управление - интуитивное управление
- LocalStorage - данные сохраняются между сессиями
- Работает на HTTPS
  
## Запуск nginx
```bash
# Останавливаем старые процессы nginx
sudo pkill nginx
# Проверяем конфигурацию
sudo nginx -t -c /.../conf/nginx.conf

# Запускаем nginx от пользователя user
sudo -u user nginx -c /.../conf/nginx.conf

# Или просто (если в конфиге указан user ...)
sudo nginx -c /.../conf/nginx.conf

# Проверяем процесс
ps aux | grep nginx | grep ...(user)

# Проверяем порт
netstat -tlnp | grep 8444

# Тестируем
curl -k https://localhost:8444/
https://localhost:8444/

# когда все настроено нужны только эти команды
sudo pkill nginx
sudo nginx -c /.../conf/nginx.conf
```
## Структура проекта
```bash
tetris-game/
├── html/
│   ├── index.html          # Страница входа
│   └── main.html           # Игровая страница
├── css/
│   ├── reset.css           # Сброс стилей
│   ├── style.css           # Стили страницы входа
│   └── main.css            # Стили игры
├── js/
│   ├── index.js            # Логика входа
│   ├── main.js             # Главный контроллер
│   ├── userManager.js      # Управление пользователями
│   └── modules/
│       ├── game.js         # Игровой движок
│       ├── field.js        # Игровое поле
│       ├── figures.js      # Система фигур
│       ├── scoreManager.js # Система счета
│       ├── figureBag.js    # Генератор фигур
│       ├── figureRenderer.js # Отрисовка фигур
│       └── nextFigureRenderer.js # Preview системы
├── image/
│   └── icon.jpeg           # Иконка игры
└── conf/
    ├── nginx.conf          # Конфиг nginx
    ├── localhost.crt       # SSL сертификат
    └── localhost.key       # SSL ключ
```

##  Уровни сложности
-Уровень повышается каждые 10 линий
-Скорость падения: 1000ms - (уровень - 1) * 100ms
-Минимальная скорость: 100ms
