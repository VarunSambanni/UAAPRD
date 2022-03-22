# UAAPRD

A web application for managing and viewing a database of proteins. The app allows users to query proteins and download files from the cloud. It also allows admins to perform CRUD operations on the database, as well as upload files to the cloud. Built mainly using NodeJS, ExpressJs and MySQL. The PDF, PDB files are stored on Google Drive, and the SQL database hosted on a remote server.  

![1](https://user-images.githubusercontent.com/87132174/159533885-8a3fea35-0c16-4a0f-a014-5e35c1ebebae.jpg)  

![9](https://user-images.githubusercontent.com/87132174/159538151-b175ceb7-c9aa-4f86-a6dc-5701eda65b06.jpg)  

When the user searches for a protein, a dropdown list consisting of all the protein names available in the database currently, are shown. Once the user hits enter all the proteins with the given name are displayed, which makes it convenient for the user to search, and also know which proteins are present in the database.  

![2](https://user-images.githubusercontent.com/87132174/159534392-15ef85eb-0c4e-4490-ab31-1699a6444745.jpg)  

The admins can login to make any changes to the database if required. The authentication is implemented by sessions.  
  
![3](https://user-images.githubusercontent.com/87132174/159534801-7dd7d579-a2b0-4ebb-ae5f-ff74e392c685.jpg)  

Creating, Updating or Deleting operations can be performed on the database. The files are uploaded to Google Drive, using the Google Drive API.   

![4](https://user-images.githubusercontent.com/87132174/159535576-765f9335-a8d2-47d6-9f01-db41bbb15154.jpg)  

Form for creating a protein:   

![5](https://user-images.githubusercontent.com/87132174/159535775-c8b40458-279c-4751-9e3a-5df52a27b6fa.jpg)  

Updating a protein:  

![6](https://user-images.githubusercontent.com/87132174/159536115-33eb7bc4-9836-4468-9835-7d2f42cbdf8f.jpg)  

Deleting a protein:  

![7](https://user-images.githubusercontent.com/87132174/159536364-75649c8e-588e-4f97-a0a5-ba01e15dd68f.jpg)



