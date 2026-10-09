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
        PDF_EXTRACTOR_API_KEY: process.env.PDF_EXTRACTOR_API_KEY
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      cwd: '/home/reader/htdocs/reader.dg5.com.br'
    }
  ]
}; 