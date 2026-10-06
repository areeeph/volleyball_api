/**
 * @param {import("mongoose").Schema} schema
 */
const softDeletePlugin = (schema) => {
  schema.add({
    deleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  function filterDeleted() {
    const filter = this.getFilter();

    if (filter.deleted === true) {
      return;
    }

    this.setQuery({
      $and: [
        filter,
        {
          $or: [{ deleted: false }, { deleted: null }],
        },
      ],
    });
  }

  schema.pre("find", filterDeleted);
  schema.pre("findOne", filterDeleted);
  schema.pre("findOneAndUpdate", filterDeleted);
  schema.pre("updateOne", filterDeleted);
  schema.pre("updateMany", filterDeleted);
  schema.pre("countDocuments", filterDeleted);

  schema.static("findDeleted", function findDeleted() {
    return this.find({ deleted: true });
  });

  schema.static("restore", async function restore(query) {
    const updatedQuery = {
      ...query,
      deleted: true,
    };

    return await this.updateMany(updatedQuery, {
      deleted: false,
      deletedAt: null,
    });
  });

  schema.static("softDelete", async function softDelete(query) {
    return await this.updateMany(query, {
      deleted: true,
      deletedAt: new Date(),
    });
  });

  schema.method("softDelete", async function softDelete() {
    this.deleted = true;
    this.deletedAt = new Date();

    await this.save();
  });
};

export default softDeletePlugin;
