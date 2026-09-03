import 'dart:convert';

import 'package:ovowpp/data/model/user/user.dart';

class DashboardResponseModel {
  String? remark;
  String? status;
  List<String>? message;
  Data? data;

  DashboardResponseModel({this.remark, this.status, this.message, this.data});

  factory DashboardResponseModel.fromRawJson(String str) => DashboardResponseModel.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DashboardResponseModel.fromJson(Map<String, dynamic> json) => DashboardResponseModel(remark: json["remark"], status: json["status"], message: json["message"] == null ? [] : List<String>.from(json["message"]!.map((x) => x)), data: json["data"] == null ? null : Data.fromJson(json["data"]));

  Map<String, dynamic> toJson() => {"remark": remark, "status": status, "message": message == null ? [] : List<dynamic>.from(message!.map((x) => x)), "data": data?.toJson()};
}

class Data {
  User? user;
  DashboardExtraData? widget;
  String? profilePath;

  Data({this.user, this.widget, this.profilePath});

  factory Data.fromRawJson(String str) => Data.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Data.fromJson(Map<String, dynamic> json) => Data(user: json["user"] == null ? null : User.fromJson(json["user"]), widget: json["widget"] == null ? null : DashboardExtraData.fromJson(json["widget"]), profilePath: json["profilePath"]);

  Map<String, dynamic> toJson() => {"user": user?.toJson(), "widget": widget?.toJson(), "profilePath": profilePath};
}

class DashboardExtraData {
  int? activeCampaign;
  int? completedCampaign;
  int? totalMessage;
  int? sentMessage;
  int? contactCount;
  String? topContact;
  int? topContactMessage;
  int? chatCompletionRate;
  Subscription? subscription;
  String? walletBalance;
  List<String>? permissions;

  DashboardExtraData({this.activeCampaign, this.completedCampaign, this.totalMessage, this.sentMessage, this.contactCount, this.topContact, this.topContactMessage, this.chatCompletionRate, this.subscription, this.walletBalance, this.permissions});

  factory DashboardExtraData.fromRawJson(String str) => DashboardExtraData.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory DashboardExtraData.fromJson(Map<String, dynamic> json) => DashboardExtraData(
    activeCampaign: json["active_campaign"],
    completedCampaign: json["completed_campaign"],
    totalMessage: json["total_message"],
    sentMessage: json["sent_message"],
    contactCount: json["contact_count"],
    topContact: json["top_contact"],
    topContactMessage: json["top_contact_message"],
    chatCompletionRate: json["chat_completion_rate"],
    subscription: json["subscription"] == null ? null : Subscription.fromJson(json["subscription"]),
    walletBalance: json["wallet_balance"],
    permissions: json["permissions"] == null ? [] : List<String>.from(json["permissions"]!.map((x) => x)),
  );

  Map<String, dynamic> toJson() => {"active_campaign": activeCampaign, "completed_campaign": completedCampaign, "total_message": totalMessage, "sent_message": sentMessage, "contact_count": contactCount, "top_contact": topContact, "top_contact_message": topContactMessage, "chat_completion_rate": chatCompletionRate, "subscription": subscription?.toJson(), "wallet_balance": walletBalance, "permissions": permissions == null ? [] : List<dynamic>.from(permissions!.map((x) => x))};
}

class Subscription {
  int? id;
  int? planId;
  int? userId;
  int? couponId;
  int? recurringType;
  String? amount;
  String? discountAmount;
  int? paymentMethod;
  int? gatewayMethodCode;
  int? autoRenewal;
  String? expiredAt;
  int? isSentExpiredNotify;
  int? isSentReminderNotify;
  String? createdAt;
  String? updatedAt;
  Plan? plan;

  Subscription({this.id, this.planId, this.userId, this.couponId, this.recurringType, this.amount, this.discountAmount, this.paymentMethod, this.gatewayMethodCode, this.autoRenewal, this.expiredAt, this.isSentExpiredNotify, this.isSentReminderNotify, this.createdAt, this.updatedAt, this.plan});

  factory Subscription.fromRawJson(String str) => Subscription.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Subscription.fromJson(Map<String, dynamic> json) => Subscription(
    id: json["id"],
    planId: json["plan_id"],
    userId: json["user_id"],
    couponId: json["coupon_id"],
    recurringType: json["recurring_type"],
    amount: json["amount"],
    discountAmount: json["discount_amount"],
    paymentMethod: json["payment_method"],
    gatewayMethodCode: json["gateway_method_code"],
    autoRenewal: json["auto_renewal"],
    expiredAt: json["expired_at"],
    isSentExpiredNotify: json["is_sent_expired_notify"],
    isSentReminderNotify: json["is_sent_reminder_notify"],
    createdAt: json["created_at"],
    updatedAt: json["updated_at"],
    plan: json["plan"] == null ? null : Plan.fromJson(json["plan"]),
  );

  Map<String, dynamic> toJson() => {"id": id, "plan_id": planId, "user_id": userId, "coupon_id": couponId, "recurring_type": recurringType, "amount": amount, "discount_amount": discountAmount, "payment_method": paymentMethod, "gateway_method_code": gatewayMethodCode, "auto_renewal": autoRenewal, "expired_at": expiredAt, "is_sent_expired_notify": isSentExpiredNotify, "is_sent_reminder_notify": isSentReminderNotify, "created_at": createdAt, "updated_at": updatedAt, "plan": plan?.toJson()};
}

class Plan {
  int? id;
  String? name;
  String? description;
  String? monthlyPrice;
  String? yearlyPrice;
  int? accountLimit;
  int? contactLimit;
  int? templateLimit;
  int? welcomeMessage;
  int? aiAssistance;
  int? interactiveMessage;
  int? ecommerceAvailable;
  int? chatbotLimit;
  int? campaignLimit;
  int? flowLimit;
  int? shortLinkLimit;
  int? floaterLimit;
  int? agentLimit;
  int? status;
  int? isPopular;
  int? apiAvailable;
  String? createdAt;
  String? updatedAt;

  Plan({this.id, this.name, this.description, this.monthlyPrice, this.yearlyPrice, this.accountLimit, this.contactLimit, this.templateLimit, this.welcomeMessage, this.aiAssistance, this.interactiveMessage, this.ecommerceAvailable, this.chatbotLimit, this.campaignLimit, this.flowLimit, this.shortLinkLimit, this.floaterLimit, this.agentLimit, this.status, this.isPopular, this.apiAvailable, this.createdAt, this.updatedAt});

  factory Plan.fromRawJson(String str) => Plan.fromJson(json.decode(str));

  String toRawJson() => json.encode(toJson());

  factory Plan.fromJson(Map<String, dynamic> json) => Plan(
    id: json["id"],
    name: json["name"],
    description: json["description"],
    monthlyPrice: json["monthly_price"],
    yearlyPrice: json["yearly_price"],
    accountLimit: json["account_limit"],
    contactLimit: json["contact_limit"],
    templateLimit: json["template_limit"],
    welcomeMessage: json["welcome_message"],
    aiAssistance: json["ai_assistance"],
    interactiveMessage: json["interactive_message"],
    ecommerceAvailable: json["ecommerce_available"],
    chatbotLimit: json["chatbot_limit"],
    campaignLimit: json["campaign_limit"],
    flowLimit: json["flow_limit"],
    shortLinkLimit: json["short_link_limit"],
    floaterLimit: json["floater_limit"],
    agentLimit: json["agent_limit"],
    status: json["status"],
    isPopular: json["is_popular"],
    apiAvailable: json["api_available"],
    createdAt: json["created_at"],
    updatedAt: json["updated_at"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "description": description,
    "monthly_price": monthlyPrice,
    "yearly_price": yearlyPrice,
    "account_limit": accountLimit,
    "contact_limit": contactLimit,
    "template_limit": templateLimit,
    "welcome_message": welcomeMessage,
    "ai_assistance": aiAssistance,
    "interactive_message": interactiveMessage,
    "ecommerce_available": ecommerceAvailable,
    "chatbot_limit": chatbotLimit,
    "campaign_limit": campaignLimit,
    "flow_limit": flowLimit,
    "short_link_limit": shortLinkLimit,
    "floater_limit": floaterLimit,
    "agent_limit": agentLimit,
    "status": status,
    "is_popular": isPopular,
    "api_available": apiAvailable,
    "created_at": createdAt,
    "updated_at": updatedAt,
  };
}
