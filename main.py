from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import sigmoid_kernel
import sys
import pandas as pd
processedData= pd.read_csv(r'../processedData.csv')

name = sys.argv[1]
## at the time of convert text into vector we will not include stop words
cv =CountVectorizer(max_features=5000,stop_words='english')
vector=cv.fit_transform(processedData['tags'])

#capture the sigmoid kernel
vector=sigmoid_kernel(vector,vector)

## WE will find similarities on the basis of cosine distance not with euclidean distance
from sklearn.metrics.pairwise import cosine_similarity
similarity=cosine_similarity(vector)

def recommend(movie):
    movie_index=processedData[processedData['Title']==movie].index[0]
    distances= similarity[movie_index]
    movies_list=sorted(list(enumerate(distances)),reverse=True,key=lambda x:x[1])[1:11]
    for i in movies_list:
        print(processedData.iloc[i[0]].Title)
    
    return

recommend(name)