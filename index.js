const express = require('express');
const { paymentMiddleware } = require('@x402/express');

const app = express();

// x402支付中间件：每调用/rate收0.02 USDC on Base主网
app.use(paymentMiddleware({
  facilitatorUrl: 'https://facilitator.cdp.coinbase.com',
  payTo: '0xa43d27e736EB8c9816102a4C48bB5e8a7Da8c5ef',  // 换成你的0x地址
  routes: {
    '/rate': {
      amount: '0.02',  // 可改0.01吸引更多调用
      asset: 'USDC',
      chainId: 'base:8453'
    }
  }
}));

// 核心API端点：/rate?from=USD&to=CNY
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
    res.status(500).json({ error: '获取失败，请重试' });
  }
});

// 加个根路径测试
app.get('/', (req, res) => {
  res.send('汇率API已上线！访问 /rate?from=USD&to=CNY 测试（需支付）');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API运行在端口 ${port}`);
});
