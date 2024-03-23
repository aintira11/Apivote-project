export interface Format {
    idx:           number;
    name:          string;
    country:       string;
    destinationid: number;
    coverimage:    string;
    detail:        string;
    price:         number;
    duration:      number;
}

export interface modelUser {
    User_Id:  number;
    UserName: string;
    Name:     string;
    Email:    string;
    Password: any;
    Avatar:   any;
    Type:     any;
}

export interface ModelPhoto {
    ImageID:     number;
    User_Id:      number;
    Name_photo:  string;
    Photo:       any;
    Date_upload: Date;
    Score:       number;
}

export interface Photo {
    type: string;
    data: any[];
}

