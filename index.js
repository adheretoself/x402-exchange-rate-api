import express from 'express';
import { paymentMiddleware } from '@x402/express';

const app = express();
const payTo = '0xa43d27e736EB8c9816102a4C48bB5e8a7Da8c5ef';  // 替换这里

// 支付中间件：只保护 /rate 端点
app.use(paymentMiddleware(payTo, {
  'GET /rate': {
    price: '$0.02',  // 每调用0.02 USDC
    network: 'base'  // 主网；测试用 'base-sepolia'
  }
}));

// 核心汇率端点
app.get('/rate', async (req, res) => {
  const { from = 'USD', to = 'EUR' } = req.query;
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    const data = await response.json();
    if (!data.rates || !data.rates[to]) {
      return res.status(400).json({ error: '不支持的货币' });
    }
    res.json({
      from,
      to,
      rate: data.rates[to],
      date: data.date
    });
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

// 欢迎页
app.get('/', (req, res) => {
  res.send('汇率付费API上线！访问 /rate?from=USD&to=CNY 测试（支付0.02 USDC）');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`运行在 ${port}`));
