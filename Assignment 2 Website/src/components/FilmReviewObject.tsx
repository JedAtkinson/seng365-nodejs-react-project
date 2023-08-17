import React from "react";
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Rating,
    Typography
} from "@mui/material";

const FilmReviewObject = (props: {review: Review}) => {
    const [review] = React.useState < Review > (props.review)

    return (
        <Card sx={{display: "flex", m: 3}}>
            <CardHeader
                sx={{textAlign: "left"}}
                avatar={
                    <Avatar src={'http://localhost:4941/api/v1/users/'+review.reviewerId+'/image'} />
                }
                title={review.reviewerFirstName+" "+review.reviewerLastName}
                subheader={new Date(review.timestamp).toDateString()}
            />
            <CardContent sx={{m: "auto"}}>
                <Rating precision={0.5} value={review.rating/2} readOnly max={5} size="small" />
                <Typography color="grey">{review.review}</Typography>
            </CardContent>
        </Card>
    )
}
export default FilmReviewObject;