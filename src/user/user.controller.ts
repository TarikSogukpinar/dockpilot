import {
  Controller,
  Get,
  Put,
  Query,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { GetMeResponseDto } from './dto/get-me.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CustomRequest } from '../core/request/customRequest';

@Controller({ path: 'users', version: '1' })
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user information',
    type: GetMeResponseDto,
  })
  async getMe(@Req() req: CustomRequest) {
    const result = await this.userService.getMe(req.user.id);
    return {
      message: 'Successfully get current user information!',
      result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns user statistics including containers and connections',
  })
  async getUserStats(@Req() req: CustomRequest) {
    const result = await this.userService.getUserStats(req.user.id);
    return {
      message: 'Successfully get user statistics!',
      result,
    };
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity history' })
  @ApiResponse({
    status: 200,
    description: 'Returns user activity logs',
  })
  async getUserActivity(@Req() req: CustomRequest) {
    const result = await this.userService.getUserActivity(req.user.id);
    return {
      message: 'Successfully get user activity!',
      result,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({
    status: 200,
    description: 'Returns users matching the search criteria',
  })
  async searchUsers(@Query('q') query: string) {
    const result = await this.userService.searchUsers(query);
    return {
      message: 'Successfully search users!',
      result,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Req() req: CustomRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const result = await this.userService.updateProfile(req.user.id, updateProfileDto);
    return {
      message: 'Successfully update user profile!',
      result,
    };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  async updatePreferences(
    @Req() req: CustomRequest,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    const result = await this.userService.updatePreferences(
      req.user.id,
      updatePreferencesDto,
    );
    return {
      message: 'Successfully update user preferences!',
      result,
    };
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get user account limits' })
  @ApiResponse({
    status: 200,
    description: 'Returns user account limits and current usage',
  })
  async getUserLimits(@Req() req: CustomRequest) {
    const result = await this.userService.getUserLimits(req.user.id);
    return {
      message: 'Successfully get user account limits!',
      result,
    };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get detailed resource usage' })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed resource usage statistics',
  })
  async getResourceUsage(@Req() req: CustomRequest) {
    const result = await this.userService.getResourceUsage(req.user.id);
    return {
      message: 'Successfully get detailed resource usage!',
      result,
    };
  }
}
