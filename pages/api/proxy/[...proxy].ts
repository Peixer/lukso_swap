// pages/api/proxy/[...proxy].ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const algoliaEndpoint = 'https://yhfn1wrcr5-dsn.algolia.net/1/indexes/prod_testnet_universal_profiles/query';
    const algoliaHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-algolia-agent': 'Algolia for JavaScript (4.20.0); Browser (lite)',
      'x-algolia-api-key': '5981bf15ffc7630353478168f2574228',
      'x-algolia-application-id': 'YHFN1WRCR5',
    };

    const algoliaPayload: Record<string, any> = {
      query: req.body.query || '', 
      hitsPerPage: req.body.hitsPerPage,
      page: req.body.page,
    };

    const response = await fetch(algoliaEndpoint, {
      method: 'POST',
      headers: algoliaHeaders,
      body: JSON.stringify(algoliaPayload), 
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
