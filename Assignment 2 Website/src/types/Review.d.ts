type Review = {
    /**
     * Reviewer user id as defined by db
     */
    reviewerId: number,
    /**
     * Rating as given by user
     */
    rating: number,
    /**
     * Review text as given by user
     */
    review: string,
    /**
     * Reviewers first name given by db
     */
    reviewerFirstName: string,
    /**
     * Reviewers last name given by db
     */
    reviewerLastName: string
    /**
     * Review time stamp defined by db
     */
    timestamp: string
}