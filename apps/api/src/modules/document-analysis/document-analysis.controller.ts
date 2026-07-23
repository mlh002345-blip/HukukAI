import { Body, Controller, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  updateExtractedDataSchema,
  type UpdateExtractedDataInput,
} from "@hukukai/validation";
import type { AuthenticatedUser } from "@hukukai/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Nest DI için değer importu gerekir
import { DocumentAnalysisService } from "./document-analysis.service";

@ApiTags("document-analysis")
@Controller("documents")
export class DocumentAnalysisController {
  constructor(
    private readonly documentAnalysisService: DocumentAnalysisService,
  ) {}

  @Post(":id/analyze")
  analyze(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.documentAnalysisService.enqueueAnalysis(user.id, id);
  }

  @Get(":id/status")
  status(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.documentAnalysisService.getStatus(user.id, id);
  }

  @Get(":id/analysis")
  analysis(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.documentAnalysisService.getAnalysis(user.id, id);
  }

  @Patch(":id/extracted-data")
  @UsePipes(new ZodValidationPipe(updateExtractedDataSchema))
  updateExtractedData(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateExtractedDataInput,
  ) {
    return this.documentAnalysisService.updateExtractedData(user.id, id, body);
  }

  @Get(":id/recommended-actions")
  recommendedActions(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.documentAnalysisService.getRecommendedActions(user.id, id);
  }
}
