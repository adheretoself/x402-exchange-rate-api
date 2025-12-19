import express from 'express';
import { paymentMiddleware } from '@x402/express';

const app = express();

const payTo = '0xa43d27e736EB8c9816102a4C48bB5e8a7Da8c5ef';  // 替换成你的0x地址

// x402支付中间件：保护 /rate 端点，每调用要求支付（价格在header中指定，官方基本配置）
app.use(paymentMiddleware({
  'GET /rate': {
    description: '实时汇率查询，每调用支付小额USDC',
    // 价格和网络在facilitator处理，或扩展配置
  }
}, payTo));  // payTo 是收款地址

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
    res.status(500).json({ error: '获取失败，请重试' });
  }
});

// 欢迎页
app.get('/', (req, res) => {
  res.send('实时汇率付费API已上线！访问 /rate?from=USD&to=CNY 测试（会返回402 Payment Required，需要支付USDC）');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API运行在端口 ${port}`);
});
