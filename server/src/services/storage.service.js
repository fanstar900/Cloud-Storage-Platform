import  supabase  from "../config/supabase.js";

const upload_file_to_storage = async (
    user_id,
    file
) => {

    const storage_path =
        `${user_id}/${Date.now()}-${file.originalname}`;

    const { error } = await supabase
        .storage
        .from("files")
        .upload(
            storage_path,
            file.buffer,
            {
                contentType: file.mimetype
            }
        );

    if(error){
        throw error;
    }

    return storage_path;
};

const delete_file_from_storage = async (
    storage_path
) => {

    const { error } = await supabase
        .storage
        .from("files")
        .remove([
            storage_path
        ]);

    if(error){
        throw error;
    }
};

const get_download_url = async (
    storage_path
) => {

    const { data, error } = await supabase
        .storage
        .from("files")
        .createSignedUrl(
            storage_path,
            60
        );

    if(error){
        throw error;
    }

    return data.signedUrl;
};

export {
    upload_file_to_storage,
    delete_file_from_storage,
    get_download_url
};