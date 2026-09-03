import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ovowpp/app/components/snack_bar/show_custom_snackbar.dart';
import 'package:ovowpp/core/translations/localization_controller.dart';
import 'package:ovowpp/core/utils/app_status.dart';
import 'package:ovowpp/core/utils/my_strings.dart';
import 'package:ovowpp/core/utils/util.dart';
import 'package:ovowpp/data/model/chat/chat_data_response_model.dart';
import 'package:ovowpp/data/model/chat/message_model.dart';
import 'package:ovowpp/data/model/chat/send_message_response_model.dart';
import 'package:ovowpp/data/model/customer_details/customer_details_response_model.dart';
import 'package:ovowpp/data/model/global/response_model/response_model.dart';
import 'package:ovowpp/data/repo/chat/chat_repo.dart';

import '../../../environment.dart';
import '../../model/chat/seen_message_response_model.dart';

class ChatController extends GetxController {
  ChatRepo repo;
  ChatController({required this.repo});
  int currentChatIndex = 0;
  final TextEditingController chatController = TextEditingController();
  LocalizationController localizationController = LocalizationController();
  bool isLoading = true;
  bool nextPageLoading = false;
  String image = "";
  String imagePath = "";
  String mediaPath = "";
  String mobile = "";
  String username = "";
  int page = 0;
  final ScrollController scrollController = ScrollController();
  List<String> more = ["Contact Details", "Send Templates"];

  File? selectedFile;

  void pickFile(int type) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      allowMultiple: false,
      type: type == 0
          ? FileType.image
          : type == 1
          ? FileType.video
          : FileType.custom,
    );

    if (result == null) return;

    selectedFile = File(result.files.single.path!);
    update();
  }

  void pickDocs() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(allowMultiple: false, type: FileType.custom, allowedExtensions: ['pdf', 'docs', 'xls']);

    if (result == null) return;

    selectedFile = File(result.files.single.path!);
    update();
  }

  void removeAttachmentFromList() {
    if (selectedFile != null) {
      try {
        selectedFile!.delete();
      } catch (e) {
        printE(e);
      }
      selectedFile = null;
      update();
    }
  }

  String conversationId = "";
  String whatsappAccountId = "";
  String lastseen = "";
  Contact? contact;
  List<MessagesData> messages = [];

  // List<MessagesData> filteredMessages = [];
  Future<void> getChatsData({bool initPage = false}) async {
    try {
      if (initPage) {
        page = 0;
        isLoading = true;
        nextPageLoading = true;
        update();
      }
      if (page == 0) {
        messages.clear();
      }

      page = page + 1;
      final responseModal = await repo.getChatsDataRepo(conversationId, page.toString(), searchQuery);
      if (responseModal.statusCode == 200) {
        ChatDataResponseModel model = ChatDataResponseModel.fromJson(responseModal.responseJson);
        if (model.status?.toLowerCase() == MyStrings.success) {
          messages.addAll(model.data?.messages?.data ?? []);
          contact = model.data?.contact;
          imagePath = model.data?.profilePath ?? "";
          mediaPath = model.data?.mediaBasePath ?? "";
          nextPageUrl = model.data?.messages?.nextPageUrl ?? "";
          whatsappAccountId = model.data?.whatsappAccountId ?? "";
        } else {
          CustomSnackBar.error(errorList: model.message ?? [MyStrings.somethingWentWrong]);
        }
      } else {
        CustomSnackBar.error(errorList: [responseModal.message]);
      }
      if (page == 1) {
        isLoading = false;
        update();
      } else {
        nextPageLoading = false;
        update();
      }
    } catch (e) {
      printE(e.toString());
      if (page == 0) {
        isLoading = false;
        update();
      } else {
        nextPageLoading = false;
        update();
      }
    }
  }

  String unseenMessageCount = "";
  Future<void> seenMessage() async {
    try {
      final responseModal = await repo.seenMessageRepo(conversationId);
      if (responseModal.statusCode == 200) {
        SeenMessageResponseModel model = SeenMessageResponseModel.fromJson(responseModal.responseJson);
        if (model.status?.toLowerCase() == MyStrings.success) {
          unseenMessageCount = model.data?.unseenMessageCount ?? "";
        } else {
          CustomSnackBar.error(errorList: model.message ?? [MyStrings.somethingWentWrong]);
        }
      } else {
        CustomSnackBar.error(errorList: [responseModal.message]);
      }
    } catch (e) {
      printE(e.toString());
    }
  }

  String searchQuery = '';

  void scrollListener() {
    if (scrollController.position.pixels == scrollController.position.maxScrollExtent) {
      if (hasNext()) {
        getChatsData();
      }
    }
  }

  String nextPageUrl = "";

  bool hasNext() {
    return nextPageUrl.isNotEmpty && nextPageUrl != 'null' ? true : false;
  }

  bool sendingMessage = false;
  void sendMessage({String? chatId, int? index}) async {
    sendingMessage = true;
    update();
    try {
      MessageModel messageModel = MessageModel(chatId: conversationId, message: chatController.text, file: selectedFile);
      ResponseModel model = await repo.sendMessageRepo(messageModel, chatId);
      if (model.statusCode == 200) {
        SentMessageResponseModel responseModel = SentMessageResponseModel.fromJson(model.responseJson);
        if (responseModel.status?.toLowerCase() == AppStatus.success) {
          final message = messages.firstWhereOrNull((msg) => msg.id == chatId);

          if (message != null) {
            message.status = AppStatus.DELIVERED;
          }

          if (responseModel.data?.message != null) {
            messages.insert(0, responseModel.data?.message ?? MessagesData());
          }
          chatController.clear();
          selectedFile = null;
          // CustomSnackBar.success(successList: responseModel.message ?? [MyStrings.requestSuccess.tr]);
        } else {
          CustomSnackBar.error(errorList: responseModel.message ?? [MyStrings.requestFail.tr]);
        }
        sendingMessage = false;
        update();
      } else {
        sendingMessage = false;
        update();
        CustomSnackBar.error(errorList: [model.message]);
      }
    } catch (e) {
      sendingMessage = false;
      update();
    }
  }

  bool downloadingFile = false;
  Map<String, String> downloadedVideoPaths = {}; // Store local paths
  Map<String, double> downloadProgress = {}; // Track download progress

  Future<String?> downloadVideoToLocal(String videoUrl, String mediaId) async {
    try {
      // Request storage permission
      if (await Permission.storage.request().isGranted || await Permission.manageExternalStorage.request().isGranted) {
        // Get local directory
        Directory? directory;
        if (Platform.isAndroid) {
          directory = await getExternalStorageDirectory();
        } else {
          directory = await getApplicationDocumentsDirectory();
        }

        if (directory != null) {
          // Create videos folder if it doesn't exist
          final videosDir = Directory('${directory.path}/videos');
          if (!await videosDir.exists()) {
            await videosDir.create(recursive: true);
          }

          final filePath = '${videosDir.path}/video_$mediaId.mp4';

          // Check if file already exists
          if (await File(filePath).exists()) {
            return filePath;
          }

          // Download file using Dio
          Dio dio = Dio();
          await dio.download(
            videoUrl,
            filePath,
            onReceiveProgress: (received, total) {
              if (total != -1) {
                downloadProgress[mediaId] = received / total;
                update();
              }
            },
          );

          return filePath;
        }
      } else {
        CustomSnackBar.error(errorList: ['Storage permission denied']);
      }
    } catch (e) {
      printE('Error downloading video: $e');
      CustomSnackBar.error(errorList: ['Failed to download video']);
    }
    return null;
  }

  Future<void> downloadAttachment(String mediaId, int index, String extension) async {
    try {
      downloadingFile = true;
      selectedIndex = index;
      update();
      // Check and request storage permission
      bool isPermissionGranted = await MyUtils.checkAndRequestStoragePermission();
      if (!isPermissionGranted) {
        CustomSnackBar.error(errorList: [MyStrings.permissionDenied]);
        return;
      }
      // Get directory path based on platform
      Directory? targetDir;
      if (Platform.isAndroid) {
        targetDir = Directory('/storage/emulated/0/Download');
      } else if (Platform.isIOS) {
        targetDir = await getApplicationDocumentsDirectory(); // iOS sandboxed path
      }

      if (targetDir == null || !targetDir.existsSync()) {
        CustomSnackBar.error(errorList: ['Download directory not found.']);
        return;
      }
      final fileName = '${Environment.appName}_${DateTime.now().millisecondsSinceEpoch}.$extension';
      final downloadPath = '${targetDir.path}/$fileName';
      // Download file
      ResponseModel responseModel = await repo.downloadFileRepo(mediaId, downloadPath);
      CustomSnackBar.success(successList: [responseModel.message]);
      MyUtils().openFile(downloadPath, extension);
    } catch (e) {
      printE(e);
    } finally {
      selectedIndex = -1;
      downloadingFile = false;
      update();
    }
  }

  Future<void> saveAndOpenFile(List<int> bytes, String fileName, String extension) async {
    Directory? downloadsDirectory;

    if (Platform.isAndroid) {
      var status = await Permission.storage.request();
      if (!status.isGranted) {
        CustomSnackBar.error(errorList: [MyStrings.permissionDenied]);
        return;
      }
      downloadsDirectory = Directory('/storage/emulated/0/Download');
    } else if (Platform.isIOS) {
      downloadsDirectory = await getApplicationDocumentsDirectory();
    }

    if (downloadsDirectory != null) {
      final downloadPath = '${downloadsDirectory.path}/$fileName';
      final file = File(downloadPath);
      await file.writeAsBytes(bytes);
      CustomSnackBar.success(successList: ['File saved at: $downloadPath']);
      await MyUtils().openFile(downloadPath, extension);
    } else {
      CustomSnackBar.error(errorList: [MyStrings.downloadDirNotFound]);
    }
  }

  bool isSearch = false;
  void changeSearchStatus() {
    isSearch = !isSearch;
    update();
  }

  List<String> status = [MyStrings.selectTemplate, "avvv", "asdsad"];
  int selectedIndex = 0;
  void changeSelectedIndex(int index) {
    selectedIndex = index;
    update();
  }
}
