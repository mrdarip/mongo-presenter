import { MongoClient } from 'mongodb';

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
  return (
    <div>
      <h1>Documents</h1>
      <table>
        <thead>
          <tr>
            <th>Num Expediente</th>
            <th>Lugar</th>
            <th>Valor Estimado</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id}>
              <td>{doc.num_expediente}</td>
              <td>{doc.lugar}</td>
              <td>{doc.valor_estimado}</td>
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