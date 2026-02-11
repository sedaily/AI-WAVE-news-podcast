import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { XMLParser } from 'fast-xml-parser';

const s3 = new S3Client({ region: 'us-east-1' });

// 경제 카테고리 코드
const ECONOMY_CODES = ['3134', '3137', '3138', '3139', '3140', '3141', '3143', '3145'];

export const handler = async (event) => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  try {
    const command = new GetObjectCommand({
      Bucket: 'sedaily-news-xml-storage',
      Key: `daily-xml/${today}.xml`
    });

    const response = await s3.send(command);
    const xmlText = await response.Body.transformToString();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const result = parser.parse(xmlText);

    const items = result.items?.item || [];
    const articles = items
      .filter(item => {
        // category가 배열일 수도 있고 단일 객체일 수도 있음
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        return categories.some(cat => ECONOMY_CODES.includes(cat?.['@_code']));
      })
      .slice(0, 10) // 최대 10개
      .map((item, i) => {
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        const firstCat = categories[0] || {};
        return {
          id: `eco-${i}`,
          title: item.title || '',
          subTitle: item.subTitle || '',
          content: item.content || '',
          categoryCode: firstCat['@_code'] || '',
          categoryName: firstCat['@_name'] || '',
          date: item.date || '',
          time: item.time || '',
          author: item.author || '',
          url: item.url?.['@_href'] || '',
          image: item.image?.['@_href'] || ''
        };
      });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ articles, count: articles.length, date: today })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
