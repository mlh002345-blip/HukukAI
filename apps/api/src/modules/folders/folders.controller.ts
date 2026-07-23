import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  createFolderSchema,
  updateFolderSchema,
  type CreateFolderInput,
  type UpdateFolderInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { FoldersService } from "./folders.service";

@ApiTags("folders")
@Controller("folders")
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createFolderSchema))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateFolderInput,
  ) {
    return this.foldersService.create(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.foldersService.findAll(user.id);
  }

  @Get(":id")
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.foldersService.findOne(user.id, id);
  }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(updateFolderSchema))
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateFolderInput,
  ) {
    return this.foldersService.update(user.id, id, body);
  }

  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.foldersService.remove(user.id, id);
    return { success: true };
  }
}
