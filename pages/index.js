import { MongoClient } from 'mongodb';
import { isValidUrl } from '@/lib/utils';

export async function getStaticProps() {
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error('Missing MongoDB configuration in .env file');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const documents = await collection.find({}).toArray();

    return {
      props: {
        documents: JSON.parse(JSON.stringify(documents)),
      },
      revalidate: 10, // Revalidate every 10 seconds
    };
  } finally {
    await client.close();
  }
}

export default function Main({ documents }) {
  const columns = 
    {"num_expediente": "Num Expediente",
    "lugar": "Lugar",
    "valor_estimado": "Valor Estimado",
    "origen": "Origen"};

  return (
    <div className="full-width">
      <h1>Documents</h1>
      <table> 
         <thead>
          <tr>
            {Object.keys(columns).map((key) => (
              <th key={key}>{columns[key]}</th>
            ))}
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {documents.filter(doc => doc.num_expediente).map((doc, index) => (
            <tr key={doc._id} style={{ '--row-number': `${index * 0.1}s` }}>

              {Object.keys(columns).map((key,value) => (

                <td key={key} title={columns[key]}>
                  {doc[key]}
                </td>
              ))}

              <td>
                <a href={`/details/${doc._id}`}>View Details</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}