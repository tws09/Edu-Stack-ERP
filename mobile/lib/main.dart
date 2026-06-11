import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:easy_localization/easy_localization.dart';
// ignore: implementation_imports
import 'package:easy_localization/src/easy_localization_controller.dart';
// ignore: implementation_imports
import 'package:easy_localization/src/localization.dart';

import 'core/storage/local_storage.dart';
import 'core/constants/storage_keys.dart';
import 'services/fcm_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // easy_localization must init before runApp
  await EasyLocalization.ensureInitialized();

  // Local storage (SharedPreferences)
  await LocalStorageService.init();

  // Pre-load translations before runApp so the Localization singleton is
  // populated on the first frame. Without this, .tr() returns raw keys until
  // Flutter's async delegate.load() resolves (fixed by hot reload, not cold start).
  final preloadController = EasyLocalizationController(
    supportedLocales: const [Locale('en'), Locale('ur')],
    startLocale: Locale(LocalStorageService.locale),
    fallbackLocale: const Locale('en'),
    path: 'assets/translations',
    useOnlyLangCode: false,
    useFallbackTranslations: true,
    saveLocale: false,
    assetLoader: const RootBundleAssetLoader(),
    onLoadError: (e) => debugPrint('[i18n preload] $e'),
  );
  await preloadController.loadTranslations();
  Localization.load(
    preloadController.locale,
    translations: preloadController.translations,
    fallbackTranslations: preloadController.fallbackTranslations,
  );

  // Offline attendance queue (Hive)
  await Hive.initFlutter();
  await Hive.openBox<Map>(StorageKeys.offlineAttendanceBox);

  // Firebase — must init before registering background handler
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('[Firebase] Init failed — push notifications disabled: $e');
  }

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('ur')],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      startLocale: Locale(LocalStorageService.locale),
      child: const ProviderScope(
        child: EduStackApp(),
      ),
    ),
  );
}
