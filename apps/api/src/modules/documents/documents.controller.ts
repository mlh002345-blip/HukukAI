import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  completeUploadSchema,
  listDocumentsQuerySchema,
  requestUploadUrlSchema,
  type CompleteUploadInput,
  type ListDocumentsQuery,
  type RequestUploadUrlInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { DocumentsService } from "./documents.service";

@ApiTags("documents")
@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("upload-url")
  @UsePipes(new ZodValidationPipe(requestUploadUrlSchema))
  createUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: RequestUploadUrlInput,
  ) {
    return this.documentsService.createUploadUrl(user.id, body);
  }

  @Post("complete-upload")
  @UsePipes(new ZodValidationPipe(completeUploadSchema))
  completeUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CompleteUploadInput,
  ) {
    return this.documentsService.completeUpload(user.id, body);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(listDocumentsQuerySchema))
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListDocumentsQuery,
  ) {
    return this.documentsService.findAll(user.id, query.folderId);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.documentsService.findOne(user.id, id);
  }

  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.documentsService.remove(user.id, id);
    return { success: true };
  }
}
