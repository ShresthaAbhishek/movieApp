import {Client, Databases, ID, Query} from 'appwrite'

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

//define new appwrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) =>{
    
    //1. use appwrite sdk/api to check if the search term exists in the database
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('searchTerm', searchTerm)])

        if(result.documents.length > 0){
            const doc = result.documents[0];

         //2. update the count
        await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
            count: doc.count + 1,
        })
        //3. If it doesn't create a new document with the search term and count as 1
        }else{
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                count: 1,
                searchTerm,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })

        }
    } catch(error){
        console.error(error);
    }   
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents;
    } catch(error) {
        console.error(error);
    }
}
