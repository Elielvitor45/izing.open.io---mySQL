import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import ContactTag from "../../models/ContactTag";

interface Request {
  id: string;
  tenantId: number | string;
}

const DeleteTagService = async ({ id, tenantId }: Request): Promise<void> => {
  const tag = await Tag.findOne({
    where: { id, tenantId }
  });

  await ContactTag.destroy({
    where:{ tagId: id}
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }
  try {
    await tag.destroy();
  } catch (error) {
    throw new AppError("ERR_TAG_CONTACTS_EXISTS", 404);
  }
};

export default DeleteTagService;
