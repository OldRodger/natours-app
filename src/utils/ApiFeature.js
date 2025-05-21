class ApiFeature {
  constructor(Model, queryParam) {
    this.query = Model.find();
    this.queryParam = queryParam;
  }

  filter() {
    const queryObj = { ...this.queryParam };
    const excludedQueries = ["sort", "page", "limit", "fields"];
    excludedQueries.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    const regex = /\b(gt|gte|lt|lte|eq)\b/g;
    queryStr = queryStr.replace(regex, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryParam.sort) {
      const sortBy = this.queryParam.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryParam.fields) {
      const fields = this.queryParam.fields.split(",").join(" ");
      this.query.select(fields);
    }
    return this;
  }

  pagination() {
    const limit = this.queryParam.limit * 1 || 100;
    const page = this.queryParam.page * 1 || 1;
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeature;
