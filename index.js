const express = require('express');
const { paymentMiddleware } = require('x402-express');
const { declareDiscoveryExtension } = require('@x402/extensions/bazaar');

const app = express();

// x402支付中间件：用Coinbase免费facilitator，每调用收0.02 USDC on Base主网
app.use(paymentMiddleware({
  payTo: '0xa43d27e736EB8c9816102a4C48bB5e8a7Da8c5ef',  // 重要！换成你的0x地址
  routes: {
    '/rate': {
      amount: '0.02',  // 每调用0.02 USDC（可改0.01吸引更多）
      asset: 'USDC',
      chainId: 'base:8453'  // Base主网
    }
  },
  facilitatorUrl: 'https://facilitator.cdp.coinbase.com'  // 官方免费facilitator
}));

// 添加Bazaar发现扩展（让AI代理自动找到）
app.use(declareDiscoveryExtension({
  name: '实时汇率查询API',
  description: '查询任意两种货币实时汇率（如USD到CNY），每调用仅0.02 USDC，低延迟可靠',
  tags: ['finance', 'currency', 'exchange-rate', 'api']
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API运行在端口 ${port}`);
});
