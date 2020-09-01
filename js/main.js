/*Realtime database*/
const database = firebase.database()
const gallery = database.ref('gallery')

/*Storage*/
const storage = firebase.storage()
const storageRef = storage.ref()
const galleryRef = storageRef.child('gallery')

var picture;

gallery.on('value', snapshot => {
    
    //alert("galería cargada")
    let galleryCollection = snapshot.val();

    console.log(Object.keys(galleryCollection))
    $("#gallery-carousel .carousel-inner").empty();
    Object.keys(galleryCollection).forEach( key => {
        console.log(galleryCollection[key].imgUrl)
        $("#gallery-carousel .carousel-inner").append(`
            <div class="carousel-item">
              <img src="${galleryCollection[key].imgUrl}" class="d-block w-100" alt="...">
              <div class="carousel-caption d-none d-md-block">
                    <h5 class="rounded p-3">${galleryCollection[key].comment}</h5>
                </div>
            </div>
        `)
    })
    $("#gallery-carousel .carousel-inner .carousel-item:first-of-type").addClass("active")

    console.log(galleryCollection)

})

$("#picture-file").on('change', event => {
    picture = event.target.files[0]
    console.log(picture)

    let reader = new FileReader();
    reader.onload = event => {
       console.log(event.target.result) 
       $("#picture-preview").attr('src',event.target.result)
    }
    reader.readAsDataURL(picture)
})

const uploadPicture = () => {
    console.log(picture);
    let uploadTask = galleryRef.child(`${picture.name}`).put(picture)

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function (error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
            case 'storage/unauthorized':
                console.log("sin permisos")
                break;

            case 'storage/canceled':
                console.log("carga cancelada")
                break;

            case 'storage/unknown':
                console.log("Lugar de carga desconocido o no disponible")
                break;
        }
    }, function () {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log('File available at', downloadURL);
            let comment = $("#picture-comment").val()
            let imgUrl = downloadURL

            let pictureObject = {comment, imgUrl}

            gallery.push(pictureObject, error => {
                error ? console.log(error) : console.log("foto subida con éxito!!!")
            })
        });
    });
}