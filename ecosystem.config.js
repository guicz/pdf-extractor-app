module.exports = {
  apps: [
    {
      name: 'pdf-extractor-app',
      script: 'node_modules/.bin/next',
      args: 'start -p 55000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 55000,
        HOSTNAME: '0.0.0.0',
        PDF_EXTRACTOR_API_URL: 'http://localhost:56002',
        PDF_EXTRACTOR_API_KEY: '34a60ac2092446db797901ddb6f223209b524e1c145e7f556343e3bf1d33c266'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      cwd: '/home/reader/htdocs/reader.dg5.com.br'
    }
  ]
}; 