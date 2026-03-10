import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GitHubService } from './github.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Public()
  @Get('repos')
  @ApiOperation({ summary: 'List GitHub repositories (public)' })
  getRepos() {
    return this.githubService.getRepos();
  }

  @Public()
  @Get('profile')
  @ApiOperation({ summary: 'Get GitHub profile info (public)' })
  getProfile() {
    return this.githubService.getProfile();
  }
}
