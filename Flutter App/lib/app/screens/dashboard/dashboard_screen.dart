import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:ovowpp/app/components/image_bg_widget.dart';
import 'package:ovowpp/app/components/shimmer/dashboard_shimmer.dart';
import 'package:ovowpp/app/components/snack_bar/show_custom_snackbar.dart';
import 'package:ovowpp/app/screens/dashboard/widget/dashboard_master_cards.dart';
import 'package:ovowpp/app/screens/dashboard/widget/notification_widget.dart';
import 'package:ovowpp/app/screens/dashboard/widget/plan_status_create_new/plan_status_and_create_new.dart';
import 'package:ovowpp/app/screens/dashboard/widget/quick_action/quick_action.dart';
import 'package:ovowpp/app/screens/dashboard/widget/recent_activity/recent_campaign.dart';
import 'package:ovowpp/app/screens/dashboard/widget/user_profile_banner.dart';
import 'package:ovowpp/core/route/route.dart';
import 'package:ovowpp/core/utils/app_permission.dart';
import 'package:ovowpp/core/utils/app_style.dart';
import 'package:ovowpp/core/utils/dimensions.dart';
import 'package:ovowpp/core/utils/my_strings.dart';
import 'package:ovowpp/core/utils/util.dart';
import 'package:ovowpp/data/controller/dashboard/dashboard_controller.dart';
import 'package:ovowpp/data/repo/campaign/campaign_repo.dart';
import 'package:ovowpp/data/repo/dashboard/dashboard_repo.dart';
import '../../../data/controller/campaigns/campaigns_controller.dart';
import '../../components/permission_denied_component.dart';
import '../bottom_nav_section/home/widget/kyc_warning_section.dart';

class DashboardScreen extends StatefulWidget {
  final Function(int navIndex)? onMenuTap;
  const DashboardScreen({super.key, this.onMenuTap});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  @override
  void initState() {
    Get.put(DashboardRepo());
    Get.put(CampaignRepo());
    final campaignController = Get.put(CampaignsController(repo: Get.find()));
    final controller = Get.put(DashboardController(repo: Get.find()));
    campaignController.tabController = TabController(length: 4, vsync: this);
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((timeStamp) async {
      controller.refreshGeneralSettings();
      controller.loadData();
      campaignController.getCampaignData();
      printX("======== Campaign data list : ${campaignController.campaignData.length}");
    });
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<DashboardController>(
      builder: (controller) => controller.isLoading
          ? DashboardShimmer()
          : MyUtils.checkPermission(AppPermission.viewDashboard) == false
          ? PermissionDeniedComponent()
          : ImageBgWidget(
              screen: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    controller.isKycVerified == "1" ? SizedBox() : KYCWarningSection(controller: controller),
                    spaceDown(Dimensions.space40.h),
                    // USER PROFILE BANNER AND NOTIFICATION
                    UserProfileBanner(
                      title: "${controller.user?.firstname ?? ''} ${controller.user?.lastname ?? ''}",
                      subTitle: MyStrings.businessOverView,
                      trailingWidget: NotificationIcon(
                        isShowToggle: true,
                        onTap: () {
                          Get.toNamed(RouteHelper.notificationScreen);
                        },
                      ),
                    ),
                    spaceDown(Dimensions.space12.h),

                    DashboardMasterCards(onMenuTap: widget.onMenuTap, controller: controller),
                    spaceDown(Dimensions.space16.h),
                    // PLAN STATUS AND CREATE NEW
                    PlanStatusAndCreateNew(
                      isShowStatus: controller.dashboardData?.subscription?.plan?.name != null ? true : false,
                      planStatusTap: () {
                        if (controller.dashboardData?.subscription?.plan?.name == null) {
                          CustomSnackBar.error(errorList: [MyStrings.noPlanStatus]);
                        } else {
                          CustomSnackBar.success(successList: ["${MyStrings.yourPlanIs} ${controller.dashboardData?.subscription?.plan?.name ?? ""}"]);
                        }
                      },
                      createNewTap: () {
                        Get.toNamed(RouteHelper.createCampaignScreen);
                      },
                    ),
                    spaceDown(Dimensions.space20.h),

                    // QUICK ACTION
                    QuickAction(),
                    spaceDown(Dimensions.space21),

                    // RECENT ACTIVITY
                    if (MyUtils.checkPermission(AppPermission.viewCampaign)) RecentCampaign(onMenuTap: widget.onMenuTap),

                    spaceDown(14),
                  ],
                ),
              ),
            ),
    );
  }
}
