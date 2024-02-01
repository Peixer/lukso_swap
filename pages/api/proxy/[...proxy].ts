// pages/api/proxy/[...proxy].ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const algoliaEndpoint = `${req.body.endpoint}`;
    const algoliaHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-algolia-agent': 'Algolia for JavaScript (4.20.0); Browser (lite)',
      'x-algolia-api-key': `${req.body.apiKey}`,
      'x-algolia-application-id': `${req.body.appId}`,
      'referer': 'https://universalprofile.cloud/',
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
