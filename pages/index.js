import { MongoClient } from 'mongodb';
import Link from 'next/link';
import RenderCellContent from '@/components/RenderCellContent';

export async function getStaticProps() {
  const { MONGODB_URI, MONGODB_DATABASE, MONGODB_COLLECTION,MONGODB_MAIN_AGGREGATE_QUERY } = process.env;

  if (!MONGODB_URI || !MONGODB_DATABASE || !MONGODB_COLLECTION) {
    throw new Error('Missing MongoDB configuration in .env file');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DATABASE);
    const collection = db.collection(MONGODB_COLLECTION);

    const pipeline = JSON.parse(MONGODB_MAIN_AGGREGATE_QUERY );
    const documents = await collection.aggregate(pipeline).toArray();

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
  const cleanedDocuments = documents.map((doc) => {
    const cleanedDoc = { ...doc };;
    delete cleanedDoc._id;
    return cleanedDoc;
  });
  const keys = [...new Set(cleanedDocuments.flatMap(obj => Object.keys(obj)))];
  return (
    <>
      <h1>Documents</h1>
      <div className="full-width">
      <table> 
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{key}</th>
              ))}

              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, rowIndex) => (
              <tr key={doc._id} style={{ '--row-number': `${rowIndex * 50}ms` }}>
                {keys.map((key, columnIndex) => (
                   <td key={key} title={doc[key]} style={{ '--column-number': `${columnIndex * 100}ms` }}>
                    <RenderCellContent value={doc[key]} />
                  </td>
                ))}

                <td style={{ '--column-number': `${keys.length * 100}ms` }}>
                  <Link href={`/details/${doc._id}`}>View Details</Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}